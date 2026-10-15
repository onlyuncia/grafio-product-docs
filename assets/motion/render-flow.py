"""Render the compact README animation from the financial WB flow."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).parent
OUTPUT = ROOT / "grafio-data-flow.gif"
WIDTH, HEIGHT = 1080, 276
CARDS = [54 + index * 199 for index in range(5)]
STAGES = [
    ("01 / WB API", "Источник", "операции кабинета"),
    ("02 / WORKER", "Загрузка", "raw-ответ"),
    ("03 / QUALITY", "Проверка", "качество данных"),
    ("04 / RULES", "Расчёт", "версия методики"),
    ("05 / REPORT", "Отчёт", "недельная версия"),
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    windows = Path("C:/Windows/Fonts")
    candidates = [
        windows / ("segoeuib.ttf" if bold else "segoeui.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


SMALL = font(13)
BODY = font(16)
TITLE = font(24, True)
BRAND = font(15, True)
NUMBER = font(12, True)


def frame(active: int, fraction: float) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), "#101214")
    draw = ImageDraw.Draw(image)

    for x in range(14, WIDTH, 24):
        for y in range(12, HEIGHT, 24):
            draw.ellipse((x, y, x + 1, y + 1), fill="#242b28")

    draw.text((54, 28), "GRAFIO", font=BRAND, fill="#dfe5e1")
    draw.text((54, 52), "Путь финансовых данных WB", font=TITLE, fill="#f4f5f4")
    draw.text((895, 36), "DATA FLOW / 01—05", font=SMALL, fill="#7a8c80")
    draw.line((54, 99, WIDTH - 54, 99), fill="#343936", width=1)

    line_y = 224
    draw.line((142, line_y, 938, line_y), fill="#3a4440", width=3)
    progress_x = int(142 + (796 * (active + fraction) / 4)) if active < 4 else 938
    draw.line((142, line_y, progress_x, line_y), fill="#72c696", width=3)

    for index, (eyebrow, label, detail) in enumerate(STAGES):
        x = CARDS[index]
        is_active = index == active
        is_past = index < active
        fill = "#233129" if is_active else "#1e2221"
        outline = "#80cfa0" if is_active else "#577663" if is_past else "#343a37"
        draw.rounded_rectangle((x, 117, x + 178, 202), radius=13, fill=fill, outline=outline, width=2 if is_active else 1)
        draw.text((x + 15, 131), eyebrow, font=NUMBER, fill="#98d5ae" if is_active else "#8d9b92")
        draw.text((x + 15, 151), label, font=BODY, fill="#f2f5f3")
        draw.text((x + 15, 178), detail, font=SMALL, fill="#aab5ad")
        draw.ellipse((x + 84, line_y - 5, x + 94, line_y + 5), fill="#80cfa0" if is_active else "#668f72" if is_past else "#48534d")

    draw.text((54, 246), "ИСТОЧНИК  →  ЗАГРУЗКА  →  КАЧЕСТВО  →  РАСЧЁТ  →  ВЕРСИЯ", font=SMALL, fill="#95a49a")
    return image


frames = []
for active_stage in range(5):
    for tick in range(6):
        frames.append(frame(active_stage, tick / 6))

frames[0].save(
    OUTPUT,
    save_all=True,
    append_images=frames[1:],
    duration=175,
    loop=0,
    optimize=True,
)
print(OUTPUT)
