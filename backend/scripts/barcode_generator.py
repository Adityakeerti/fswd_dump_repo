#!/usr/bin/env python3
"""
Barcode generator for library books.
Uses MySQL via SQLAlchemy (same DB as the main application).
"""

import os
import sys
import io
import math
from PIL import Image, ImageDraw, ImageFont
from barcode import Code128
from barcode.writer import ImageWriter

# Add parent directory to path so we can import the app package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import Book


def _get_fonts(scale=1):
    """Try to load standard fonts, fallback to default."""
    try:
        # For Windows/Mac standard fonts
        title_font = ImageFont.truetype("arialbd.ttf", int(24 * scale))
        author_font = ImageFont.truetype("ariali.ttf", int(18 * scale))
        lib_font = ImageFont.truetype("arial.ttf", int(14 * scale))
        code_font = ImageFont.truetype("courbd.ttf", int(22 * scale))
        return title_font, author_font, lib_font, code_font
    except Exception:
        # Fallback to default
        font = ImageFont.load_default()
        return font, font, font, font

def _center_text(draw, text, font, box_x, box_y, box_width, fill="black"):
    """Helper to horizontally center text within a box."""
    # textbbox returns (left, top, right, bottom)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    
    # If text is too wide, truncate
    if text_w > box_width - 20:
        while text_w > box_width - 40 and len(text) > 3:
            text = text[:-1]
            bbox = draw.textbbox((0, 0), text + "...", font=font)
            text_w = bbox[2] - bbox[0]
        text += "..."
    
    x = box_x + (box_width - text_w) / 2
    draw.text((x, box_y), text, fill=fill, font=font)

def create_professional_label(book, scale=1.0):
    """Creates a beautiful, single book label. scale=1 creates a ~600x300 image."""
    label_w = int(600 * scale)
    label_h = int(300 * scale)
    
    # White background with a subtle border
    img = Image.new('RGB', (label_w, label_h), 'white')
    draw = ImageDraw.Draw(img)
    draw.rectangle([(0, 0), (label_w-1, label_h-1)], outline="#CCCCCC", width=2)
    
    title_font, author_font, lib_font, code_font = _get_fonts(scale)
    
    # 1. Top Header (Library Name)
    _center_text(draw, "PUSTAK TRACKER LIBRARY", lib_font, 0, int(15 * scale), label_w, fill="#555555")
    
    # Divider line
    draw.line([(int(40 * scale), int(40 * scale)), (label_w - int(40 * scale), int(40 * scale))], fill="#EEEEEE", width=2)
    
    # 2. Book Title
    _center_text(draw, book.title, title_font, 0, int(55 * scale), label_w, fill="#000000")
    
    # 3. Book Author
    author_text = f"by {book.author}" if book.author else ""
    _center_text(draw, author_text, author_font, 0, int(90 * scale), label_w, fill="#666666")
    
    # 4. Barcode
    # Generate pure barcode without text (we add text manually for better control)
    writer = ImageWriter()
    writer_options = {
        'module_width': 0.35 * scale,
        'module_height': 12.0 * scale,
        'font_size': 0, # Hide built-in text
        'text_distance': 0,
        'quiet_zone': 1.0,
        'background': 'white',
        'foreground': 'black',
        'center_text': False
    }
    
    code = Code128(book.barcode_id, writer=writer)
    buffer = io.BytesIO()
    code.write(buffer, options=writer_options)
    buffer.seek(0)
    
    barcode_img = Image.open(buffer)
    
    # Paste barcode centered
    bc_w, bc_h = barcode_img.size
    bc_x = (label_w - bc_w) // 2
    bc_y = int(140 * scale)
    
    # Only paste if it fits, otherwise scale it down
    if bc_w > label_w - 40:
        ratio = (label_w - 40) / float(bc_w)
        barcode_img = barcode_img.resize((int(bc_w * ratio), int(bc_h * ratio)), Image.LANCZOS)
        bc_w, bc_h = barcode_img.size
        bc_x = (label_w - bc_w) // 2
        
    img.paste(barcode_img, (bc_x, bc_y))
    
    # 5. Barcode Text (centered below barcode)
    _center_text(draw, book.barcode_id, code_font, 0, bc_y + bc_h + int(10 * scale), label_w, fill="#000000")
    
    return img

def generate_barcodes():
    """Generate individual barcode images for all books"""
    app = create_app()
    os.makedirs("barcodes/individual", exist_ok=True)

    with app.app_context():
        books = Book.query.filter(Book.barcode_id.isnot(None)).all()
        print(f"📚 Generating beautiful barcodes for {len(books)} books...")

        for book in books:
            img = create_professional_label(book, scale=1.0)
            filename = f"barcodes/individual/{book.barcode_id}.png"
            img.save(filename)
            print(f"  ✅ {book.barcode_id} - {book.title[:30]}...")

        print(f"\n🎉 Generated {len(books)} barcode images in 'barcodes/individual/' folder")

def generate_barcode_sheet():
    """Generate printable A4 sheets (3x8 grid of labels)"""
    app = create_app()
    os.makedirs("barcodes/sheets", exist_ok=True)

    with app.app_context():
        books = Book.query.filter(Book.barcode_id.isnot(None)).all()
        
        # A4 at 300 DPI
        sheet_w, sheet_h = 2480, 3508
        
        # Layout metrics: 3 columns, 8 rows (24 labels per sheet)
        cols, rows = 3, 8
        labels_per_sheet = cols * rows
        
        # Margin and padding
        margin_x, margin_y = 100, 100
        spacing_x, spacing_y = 40, 40
        
        # Calculate cell size
        cell_w = (sheet_w - (2 * margin_x) - ((cols - 1) * spacing_x)) // cols
        cell_h = (sheet_h - (2 * margin_y) - ((rows - 1) * spacing_y)) // rows
        
        num_sheets = math.ceil(len(books) / labels_per_sheet)
        
        print(f"📄 Creating {num_sheets} sheet(s) for {len(books)} books...")
        
        for sheet_idx in range(num_sheets):
            sheet = Image.new('RGB', (sheet_w, sheet_h), 'white')
            draw = ImageDraw.Draw(sheet)
            
            # Draw cutting guides (light gray dashed lines)
            for i in range(1, cols):
                x = margin_x + i * cell_w + (i - 1) * spacing_x + (spacing_x // 2)
                draw.line([(x, 0), (x, sheet_h)], fill="#E0E0E0", width=2)
            for j in range(1, rows):
                y = margin_y + j * cell_h + (j - 1) * spacing_y + (spacing_y // 2)
                draw.line([(0, y), (sheet_w, y)], fill="#E0E0E0", width=2)
            
            start_idx = sheet_idx * labels_per_sheet
            end_idx = min(start_idx + labels_per_sheet, len(books))
            sheet_books = books[start_idx:end_idx]
            
            for idx, book in enumerate(sheet_books):
                col = idx % cols
                row = idx // cols
                
                x = margin_x + col * (cell_w + spacing_x)
                y = margin_y + row * (cell_h + spacing_y)
                
                # To fill the cell cleanly, we calculate scale relative to standard label dimensions (600x300)
                scale = min(cell_w / 600.0, cell_h / 300.0) 
                
                label_img = create_professional_label(book, scale=scale)
                
                # Center label inside its allocated grid cell
                lw, lh = label_img.size
                loc_x = x + (cell_w - lw) // 2
                loc_y = y + (cell_h - lh) // 2
                
                sheet.paste(label_img, (int(loc_x), int(loc_y)))
            
            filename = f"barcodes/sheets/barcode_sheet_{sheet_idx + 1}.png"
            sheet.save(filename)
            print(f"  ✅ Saved {filename} ({len(sheet_books)} labels)")
            
if __name__ == '__main__':
    print("🏷️  PROFESSIONAL BARCODE GENERATOR")
    print("=" * 35)

    choice = input("Generate: (1) Individual barcodes (2) Print sheets (3) Both [1]: ").strip()

    if choice in ['2', 'sheet']:
        generate_barcode_sheet()
    elif choice in ['3', 'both']:
        generate_barcodes()
        generate_barcode_sheet()
    else:
        generate_barcodes()