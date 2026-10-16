import pymupdf
import os

os.makedirs("data/pages", exist_ok=True)

# Volume 1 - Unit 2 My House (Book pages 16 to 25 -> PDF pages 15 to 25)
doc1 = pymupdf.open("SGK Tieng Anh 6 Tap 1- Global Success.pdf")
for pno in range(15, 26):
    pix = doc1[pno].get_pixmap(dpi=150)
    pix.save(f"data/pages/t1_p{pno+1}.png")
print("Volume 1 Unit 2 saved.")

# Volume 2 - Unit 7 Television (Book pages 6 to 15 -> PDF pages 5 to 16)
doc2 = pymupdf.open("SGK Tieng Anh 6 Tap 2 - Global Success.pdf")
for pno in range(5, 16):
    pix = doc2[pno].get_pixmap(dpi=150)
    pix.save(f"data/pages/t2_p{pno+1}.png")
print("Volume 2 Unit 7 saved.")
