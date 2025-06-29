
# 🌍 Zoniq: redefining disease risk for a changing planet
Built as part of the AI4Good Lab – Toronto Cohort (2025), Team 3 Project

**AI-powered climate intelligence for global health**
Predict tomorrow’s Neglected Tropical Disease (NTD) hotspots **before outbreaks happen.**

🚀 [Explore the Deployed Website](https://diantw00rd.github.io/ZONIQ/)

## 🔍 Why Zoniq Matters

Climate change is accelerating the emergence and migration of diseases - reshaping boundaries faster than traditional public health systems can adapt.

**Zoniq** integrates:

* 🌡️ Real-time climate data
* 🧬 Epidemiological patterns
* 🤖 Machine learning forecasting

Together, these power a platform that **anticipates NTD risks before outbreaks**, enabling timely interventions and data-driven public health strategy.

## 🌐 Website Highlights

Our live platform showcases:

* 📍 Visualize predicted NTD hotspots in **Nigeria (2026–2028)**
* 📈 XGBoost-driven forecasts grounded in climate and disease data
* 🌎 Expansion plans to model disease risk **worldwide**

## 📁 Project Structure

### `xgboost.ipynb`

A detailed Jupyter Notebook containing:

*  Benchmarked models:

  * Logistic Regression
  * Random Forest
  * XGBoost
  * PCA 
*  Performance metrics (precision, recall, F1)
*  Data inputs and generated reports

## Model Benchmarks

| Model                   | Precision (Class 1) | Recall (Class 1) | F1 Score (Class 1) | Accuracy  |
| ----------------------- | ------------------- | ---------------- | ------------------ | --------- |
| **Logistic Regression** | 0.71                | 0.11             | 0.20               | 81.5%     |
| **Random Forest**       | 0.53                | 0.44             | 0.48               | 81.2%     |
| **XGBoost** *(Best)*    | **0.67**            | **0.72**         | **0.70**           | **87.0%** |


## Data 

* WHO NTD surveillance data
* ERA5 climate reanalysis datasets
* Local health and demographic surveys
* Custom engineered features from spatial-temporal trends

## License

MIT License © 2025 — Zoniq AI Team


