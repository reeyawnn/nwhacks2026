import tensorflow as tf
import numpy as np
import json

# 1. Load the "Brain" you just created
model = tf.keras.models.load_model('squat_detector_model.h5')

def evaluate_movement(file_path):
    with open(file_path) as f:
        content = json.load(f)
        # Process data exactly like we did in training
        raw_data = content['data'][:20]
        betas = np.array([p['beta'] for p in raw_data])
        betas = betas - betas[0]
        accels = np.array([p['verticalAccel'] for p in raw_data])
        vels = np.diff(betas, prepend=0)
        
        # Prepare shape for the model: (1 sample, 20 steps, 3 features)
        sample = np.stack([betas, accels, vels], axis=1)
        sample = np.expand_dims(sample, axis=0) 
        
        # Get prediction (0.0 to 1.0)
        prediction = model.predict(sample, verbose=0)[0][0]
        
        result = "SQUAT" if prediction > 0.5 else "NOT A SQUAT"
        print(f"Result: {result} ({prediction*100:.1f}% confidence)")

# TRY IT OUT:
print("Testing a known squat:")
evaluate_movement('testing_data/squat_1768713050231.json')