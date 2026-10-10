"""Strict, pure parser for Bambu Studio consumption evidence, not print approval."""
import math
import re

SETTING_KEYS={'layer_height','wall_loops','wall_generator','sparse_infill_density','sparse_infill_pattern','top_shell_layers','bottom_shell_layers','top_shell_thickness','bottom_shell_thickness','brim_type','brim_width','skirt_loops','enable_support','line_width','outer_wall_line_width','inner_wall_line_width','filament_density','filament_type','printer_model','printer_variant'}

def parse_metadata(gcode):
    markers=['; HEADER_BLOCK_START','; HEADER_BLOCK_END','; CONFIG_BLOCK_START','; CONFIG_BLOCK_END','; EXECUTABLE_BLOCK_START','; EXECUTABLE_BLOCK_END']
    positions=[gcode.find(m) for m in markers]
    if any(p<0 for p in positions) or positions!=sorted(positions):
        raise ValueError('Missing/truncated/out-of-order required G-code blocks')
    header=gcode[positions[0]:positions[1]]
    def positive(label):
        values=re.findall(r'^;\s*'+re.escape(label)+r'\s*:\s*([^\n]+)',header,re.M)
        if len(values)!=1:raise ValueError('Missing/duplicate header field '+label)
        try:value=float(values[0])
        except ValueError:raise ValueError('Invalid numeric header '+label)
        if not math.isfinite(value) or value<=0:raise ValueError('Nonpositive/nonfinite header '+label)
        return value
    grams=positive('total filament weight [g]')
    length=positive('total filament length [mm]')
    density=positive('filament_density')
    diameter=positive('filament_diameter')
    times=re.findall(r'^; model printing time: ([^;\n]+); total estimated time: ([^\n]+)',header,re.M)
    if len(times)!=1:raise ValueError('Missing/duplicate time header')
    def time_seconds(value):
        if not re.fullmatch(r'(?:\d+h\s*)?(?:\d+m\s*)?(?:\d+s\s*)?',value.strip()) or not value.strip():raise ValueError('Invalid time header')
        return sum(int(v)*{'h':3600,'m':60,'s':1}[u] for v,u in re.findall(r'(\d+)([hms])',value))
    config=gcode[positions[2]:positions[3]]
    settings={m.group(1).strip():m.group(2).strip() for m in re.finditer(r'^;\s*([^\n=]+?)\s*=\s*([^\n]+)',config,re.M) if m.group(1).strip() in SETTING_KEYS}
    if settings.get('printer_model')!='Bambu Lab X2D' or settings.get('printer_variant')!='0.4':raise ValueError('Output did not confirm X2D 0.4 profile')
    executable=gcode[positions[4]:positions[5]]
    return {'header':header.splitlines()[:13],'grams':grams,'slicerReportedFilamentLengthMm':length,'volumeFromLengthCm3':length*math.pi*(diameter/2)**2/1000,'filamentDensityGPerCm3':density,'modelTime':times[0][0].strip(),'totalEstimatedTime':times[0][1].strip(),'modelTimeSeconds':time_seconds(times[0][0]),'totalEstimatedTimeSeconds':time_seconds(times[0][1]),'time':times[0][0].strip()+'; total estimated time: '+times[0][1].strip(),'supportToolpathsPresent':bool(re.search(r'^; FEATURE: Support',executable,re.M)),'settings':settings}
