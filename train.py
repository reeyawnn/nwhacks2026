import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split

# --- 1. DATA LOADING ---
def prepare_data(base_directory):
    X, y = [], []
    categories = {'non_squat': 0, 'squat': 1}
    
    for category, label in categories.items():
        folder_path = os.path.join(base_directory, category)
        if not os.path.exists(folder_path):
            continue
            
        print(f"Loading {category} files...")
        for filename in os.listdir(folder_path):
            if filename.endswith(".json"):
                with open(os.path.join(folder_path, filename)) as f:
                    content = json.load(f)
                    raw_data = content['data'][:20]
                    if len(raw_data) < 20: continue
                    
                    betas = np.array([p['beta'] for p in raw_data])
                    betas = betas - betas[0] # Zero-center for "Shape"
                    accels = np.array([p['verticalAccel'] for p in raw_data])
                    vels = np.diff(betas, prepend=0)
                    
                    sample = np.stack([betas, accels, vels], axis=1)
                    X.append(sample)
                    y.append(label)
    return np.array(X), np.array(y)

X, y = prepare_data('training_data')
print(f"Total samples loaded: {len(X)}")

# --- 2. TRAIN/TEST SPLIT ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- 3. DEFINE THE MODEL ---
model = models.Sequential([
    layers.Conv1D(filters=16, kernel_size=3, activation='relu', input_shape=(20, 3)),
    layers.MaxPooling1D(pool_size=2),
    layers.Conv1D(filters=32, kernel_size=3, activation='relu'),
    layers.GlobalAveragePooling1D(),
    layers.Dense(16, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# --- 4. RUN TRAINING ---
print("Training model...")
model.fit(X_train, y_train, epochs=100, validation_data=(X_test, y_test), batch_size=4, verbose=1)

# --- 5. SAVE THE FILE ---
model.save('squat_detector_model.h5')
print("\nSUCCESS: 'squat_detector_model.h5' has been created in your folder!")