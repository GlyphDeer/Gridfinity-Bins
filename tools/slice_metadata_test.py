import unittest
from slice_metadata import parse_metadata
# Real successful header values, minimal config/body markers retained for parser fixtures.
VALID='''; HEADER_BLOCK_START
; BambuStudio 02.08.04.57
; model printing time: 55m 40s; total estimated time: 1h 0m 49s
; total filament length [mm] : 10483.64
; total filament weight [g] : 31.27
; filament_density: 1.24
; filament_diameter: 1.75
; HEADER_BLOCK_END
; CONFIG_BLOCK_START
; printer_model = Bambu Lab X2D
; printer_variant = 0.4
; enable_support = 0
; CONFIG_BLOCK_END
; EXECUTABLE_BLOCK_START
; FEATURE: Outer wall
G1 X10 Y20 E1
; EXECUTABLE_BLOCK_END
'''
class MetadataTests(unittest.TestCase):
    def test_valid_header(self):
        m=parse_metadata(VALID);self.assertEqual(m['grams'],31.27);self.assertEqual(m['modelTimeSeconds'],3340);self.assertEqual(m['totalEstimatedTimeSeconds'],3649);self.assertFalse(m['supportToolpathsPresent']);self.assertAlmostEqual(m['volumeFromLengthCm3'],25.2161,places=3)
    def test_missing_and_truncated_blocks(self):
        for marker in ['; HEADER_BLOCK_END','; CONFIG_BLOCK_END','; EXECUTABLE_BLOCK_END']:
            with self.subTest(marker=marker),self.assertRaises(ValueError):parse_metadata(VALID.replace(marker,''))
    def test_invalid_values(self):
        for value in ['-1','0','NaN','inf','nonsense']:
            with self.subTest(value=value),self.assertRaises(ValueError):parse_metadata(VALID.replace('31.27',value))
    def test_missing_and_duplicate_measurements(self):
        line='; total filament weight [g] : 31.27\n'
        for replaced in ['',line+line]:
            with self.subTest(replaced=replaced),self.assertRaises(ValueError):parse_metadata(VALID.replace(line,replaced))
    def test_wrong_machine(self):
        with self.assertRaises(ValueError):parse_metadata(VALID.replace('Bambu Lab X2D','Bambu Lab X1C'))
    def test_invalid_time(self):
        with self.assertRaises(ValueError):parse_metadata(VALID.replace('55m 40s','invalid'))
    def test_support_feature_is_executable_only(self):
        self.assertTrue(parse_metadata(VALID.replace('; FEATURE: Outer wall','; FEATURE: Support'))['supportToolpathsPresent'])
if __name__=='__main__':unittest.main()
