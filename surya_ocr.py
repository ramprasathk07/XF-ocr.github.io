from PIL import Image
from surya.detection import batch_inference
from surya.model.segformer import load_model, load_processor

image = Image.open("D:\\git-repos\\openwebUI\\v1\\uploads\\images\\ramknin_gmail_com\\20260104_220036_af33bdff\\Resume_13_12_2025_p0.png")
model, processor = load_model(), load_processor()

# predictions is a list of dicts, one per image
predictions = batch_inference([image], model, processor)
print(predictions)