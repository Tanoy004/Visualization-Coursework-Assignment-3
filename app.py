import pandas as pd
import numpy as np
from flask import Flask, jsonify
from flask_cors import CORS
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler
import json


app = Flask(__name__)
from sklearn.cluster import KMeans
from sklearn.metrics import mean_squared_error
from sklearn.metrics import euclidean_distances
from sklearn.manifold import MDS

CORS(app, resources={r"/api/*": {"origins": "*"}})

json_data = {}

def normal_fetch():
    global json_data
    cat_dataset = pd.read_csv("life expectancy dataset-all.csv")
    num_dataset = pd.read_csv("life expectancy dataset-numeric.csv")
    col = num_dataset.columns.tolist()



    scaler = MinMaxScaler()
    scaler.fit(num_dataset)
    data = scaler.transform(num_dataset)
    dist_mat = euclidean_distances(data)
    mds = MDS(n_components=2, dissimilarity="precomputed", random_state=35)
    mds_transformed = mds.fit_transform(dist_mat)
    mds_data = [{"x": point[0], "y": point[1]} for point in mds_transformed]

    res = []
    for k in range(1, 11):
        kmeans = KMeans(n_clusters=k, random_state=35)
        kmeans.fit(data)
        cluster_labels = kmeans.labels_
        cluster_centers = kmeans.cluster_centers_
        mse = mean_squared_error(data, cluster_centers[cluster_labels])
        res.append({"k": k, "MSE": mse, "cluster_labels": cluster_labels.tolist()})

    co_mat = num_dataset.corr()
    dist_mat = 1 - np.abs(co_mat)
    mds = MDS(n_components=2, dissimilarity="precomputed", random_state=35)
    mds_trans = mds.fit_transform(dist_mat)
    var = co_mat.columns
    att_data = [{"x": point[0], "y": point[1], "name": var[i]} for i, point in enumerate(mds_trans)]

    json_data = json.dumps(
        {
            "all_dataset": cat_dataset.to_dict('records'),
            "dataset": num_dataset.to_dict('records'),
            "kmeans": res,
            "col": col,
            "mds_data": mds_data,
            "attributes_data": att_data
        }
    )

@app.route("/api/data")
def get_data():
    global json_data
    return json_data


if __name__ == "__main__":
    normal_fetch()
    app.run(debug=True)
