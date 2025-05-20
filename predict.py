import sys
import json
import pickle
import numpy as np

try:
    # Cargar modelo
    with open("modelo_senas.pkl", "rb") as f:
        model = pickle.load(f)

    # Leer keypoints desde argumentos
    keypoints = json.loads(sys.argv[1])  # Espera un JSON como string
    x = np.array(keypoints).reshape(1, -1)

    # Predecir
    pred = model.predict(x)

    # Imprimir predicción en formato JSON
    print(json.dumps({"prediccion": pred[0]}))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
