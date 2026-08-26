from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "original-form"


def read_image(asset_name: str):
    asset_path = ASSET_DIR / asset_name
    image = cv2.imdecode(np.fromfile(asset_path, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise AssertionError(f"missing raster asset: {asset_name}")
    return image


def stable_land_mask(asset_name: str, minimum_area: int = 30_000):
    image = read_image(asset_name)

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    land = (hsv[:, :, 0] < 50).astype(np.uint8)
    land = cv2.morphologyEx(land, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    land = cv2.morphologyEx(land, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))

    count, labels, stats, _ = cv2.connectedComponentsWithStats(land, 8)
    stable = np.zeros_like(land)
    for index in range(1, count):
        if stats[index, cv2.CC_STAT_AREA] >= minimum_area:
            stable[labels == index] = 1

    return image, stable


def land_labels(asset_name: str, minimum_area: int = 30_000):
    _, stable = stable_land_mask(asset_name, minimum_area)

    component_count, components, _, _ = cv2.connectedComponentsWithStats(stable, 8)
    land_distance = cv2.distanceTransform(stable, cv2.DIST_L2, 5)
    water_distance = cv2.distanceTransform(1 - stable, cv2.DIST_L2, 5)
    return components, land_distance, water_distance, component_count - 1


def validate_monochrome_alignment(
    source_name: str, mono_name: str, minimum_area: int = 30_000
):
    """Verify that public art is unfilled monochrome art over the source topology."""
    source, land = stable_land_mask(source_name, minimum_area)
    mono = read_image(mono_name)

    source_height, source_width = source.shape[:2]
    mono_height, mono_width = mono.shape[:2]
    width_error = abs(mono_width / source_width - 1.0)
    height_error = abs(mono_height / source_height - 1.0)
    if width_error > 0.02 or height_error > 0.02:
        raise AssertionError(
            f"{mono_name} changed the topology canvas size too much: "
            f"source={source_width}x{source_height}, mono={mono_width}x{mono_height}"
        )

    gray = cv2.cvtColor(mono, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(mono, cv2.COLOR_BGR2HSV)
    white_ratio = float(np.mean(gray >= 245))
    black_ratio = float(np.mean(gray <= 96))
    colored_ratio = float(np.mean(hsv[:, :, 1] > 20))
    if white_ratio < 0.90:
        raise AssertionError(
            f"{mono_name} must remain mostly white with no land/sea fill: {white_ratio:.3f}"
        )
    if not 0.015 <= black_ratio <= 0.12:
        raise AssertionError(
            f"{mono_name} needs visible but unfilled black linework: {black_ratio:.3f}"
        )
    if colored_ratio > 0.03:
        raise AssertionError(
            f"{mono_name} contains too much colored fill: {colored_ratio:.3f}"
        )

    # The generated monochrome drawing can be antialiased and shifted slightly, so
    # compare coast coverage after resizing and dilating both edge masks. This is
    # deliberately tolerant of line thickness while still rejecting a new topology.
    resized = cv2.resize(mono, (source_width, source_height), interpolation=cv2.INTER_AREA)
    resized_gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    mono_lines = (resized_gray < 190).astype(np.uint8)
    coastline = cv2.morphologyEx(
        land, cv2.MORPH_GRADIENT, np.ones((5, 5), dtype=np.uint8)
    )
    tolerance = max(24, round(min(source_height, source_width) * 0.07))
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (2 * tolerance + 1, 2 * tolerance + 1)
    )
    near_mono_line = cv2.dilate(mono_lines, kernel)
    near_source_coast = cv2.dilate(coastline, kernel)
    coast_pixels = coastline.astype(bool)
    line_pixels = mono_lines.astype(bool)
    coast_coverage = float(np.mean(near_mono_line[coast_pixels] > 0))
    line_alignment = float(np.mean(near_source_coast[line_pixels] > 0))
    if coast_coverage < 0.90 or line_alignment < 0.90:
        raise AssertionError(
            f"{mono_name} coastline no longer aligns with {source_name}: "
            f"coast coverage={coast_coverage:.3f}, line alignment={line_alignment:.3f}, "
            f"tolerance={tolerance}px"
        )

    return white_ratio, black_ratio, coast_coverage, line_alignment


def sample(components, land_distance, water_distance, point):
    height, width = components.shape
    x = min(width - 1, max(0, round(point[0] * width / 100)))
    y = min(height - 1, max(0, round(point[1] * height / 100)))
    component = int(components[y, x])
    margin = float((land_distance if component else water_distance)[y, x])
    return component, margin


def assert_margin(name, values, minimum=40.0):
    for index, (_, margin) in enumerate(values, 1):
        if margin < minimum:
            raise AssertionError(f"{name} point {index} is too close to a coast: {margin:.1f}px")


def validate_round_one():
    mono_metrics = validate_monochrome_alignment(
        "gpt-island-maze-dense-a-v1.png", "gpt-island-maze-mono-a-v1.png"
    )
    components, land_distance, water_distance, component_count = land_labels(
        "gpt-island-maze-dense-a-v1.png"
    )
    if component_count != 2:
        raise AssertionError(f"round 1 expected two stable land components, got {component_count}")

    connected = [(6.6, 17.3), (40.8, 38.5), (84.3, 13.8), (86.8, 32.9), (57.9, 84.1), (88.6, 82.2)]
    disconnected = [(6.1, 67.1), (15.4, 66.7), (20.5, 80.6), (64.1, 59.9), (22.8, 64.6), (82.2, 56.5), (74.5, 47.2), (13.0, 47.6), (30.3, 34.8), (47.6, 57.9)]
    connected_samples = [sample(components, land_distance, water_distance, point) for point in connected]
    disconnected_samples = [sample(components, land_distance, water_distance, point) for point in disconnected]

    main_component = connected_samples[0][0]
    if not main_component or any(component != main_component for component, _ in connected_samples):
        raise AssertionError("round 1 connected frogs are not all on the palm island")
    if any(component == main_component for component, _ in disconnected_samples):
        raise AssertionError("round 1 has a non-answer frog on the palm island")
    assert_margin("round 1 connected", connected_samples)
    assert_margin("round 1 disconnected", disconnected_samples)
    return len(connected), len(disconnected), mono_metrics


def validate_round_two():
    mono_metrics = validate_monochrome_alignment(
        "gpt-island-maze-dense-b-v1.png",
        "gpt-island-maze-mono-b-v1.png",
        minimum_area=50_000,
    )
    components, land_distance, water_distance, component_count = land_labels(
        "gpt-island-maze-dense-b-v1.png", minimum_area=50_000
    )
    if component_count != 2:
        raise AssertionError(f"round 2 expected exactly two islands, got {component_count}")

    island_a = [(8.0, 25.9), (28.0, 16.3), (42.2, 21.3), (9.4, 71.8), (28.4, 46.5), (43.1, 65.9), (31.5, 80.5)]
    island_b = [(62.7, 29.6), (76.7, 30.0), (92.4, 26.4), (70.7, 55.7), (85.6, 70.8)]
    water = [(32.7, 28.2), (13.9, 41.8), (22.5, 57.9), (83.3, 48.1), (70.7, 37.9), (75.4, 66.5), (48.3, 25.1), (50.5, 48.0)]
    a_samples = [sample(components, land_distance, water_distance, point) for point in island_a]
    b_samples = [sample(components, land_distance, water_distance, point) for point in island_b]
    water_samples = [sample(components, land_distance, water_distance, point) for point in water]

    a_component = a_samples[0][0]
    b_component = b_samples[0][0]
    if not a_component or any(component != a_component for component, _ in a_samples):
        raise AssertionError("round 2 island A frogs do not share one island")
    if not b_component or b_component == a_component or any(component != b_component for component, _ in b_samples):
        raise AssertionError("round 2 island B frogs do not share the other island")
    if any(component != 0 for component, _ in water_samples):
        raise AssertionError("round 2 water frog is touching an island")
    assert_margin("round 2 island A", a_samples)
    assert_margin("round 2 island B", b_samples)
    assert_margin("round 2 water", water_samples)
    return len(island_a), len(island_b), len(water), mono_metrics


def main():
    round_one = validate_round_one()
    round_two = validate_round_two()
    print(
        "original-form island mask validation: pass "
        f"(round1 connected/disconnected={round_one[0]}/{round_one[1]}, "
        f"round2 A/B/water={round_two[0]}/{round_two[1]}/{round_two[2]}, "
        f"mono coastline coverage={round_one[2][2]:.3f}/{round_two[3][2]:.3f})"
    )


if __name__ == "__main__":
    main()
