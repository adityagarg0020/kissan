import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from data_loader import load_historical_data
from feature_engineering import create_time_series_features

def mean_absolute_percentage_error(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    valid = y_true > 0
    return np.mean(np.abs((y_true[valid] - y_pred[valid]) / y_true[valid])) * 100

def train_and_evaluate_models():
    print("=" * 70)
    print("KISANSAATHI ML TRAINING PIPELINE (CHRONOLOGICAL TIME-SERIES)")
    print("=" * 70)
    
    # 1. Load data
    df_raw = load_historical_data()
    print(f"Loaded {len(df_raw)} records.")
    
    # 2. Engineer features
    df = create_time_series_features(df_raw)
    print(f"Features created. Available rows: {len(df)}")
    
    target_col = 'Mandi Modal Price (AgMarknet)'
    feature_cols = [
        'lag_1', 'lag_2', 'lag_3', 'lag_12',
        'rolling_mean_3', 'rolling_std_3',
        'rolling_mean_6', 'rolling_mean_12',
        'momentum_3', 'ratio_to_12m',
        'month', 'quarter', 'month_sin', 'month_cos'
    ]
    
    # One-hot or ordinal encoding for Crop
    crop_dummies = pd.get_dummies(df['Crop'], prefix='crop', drop_first=True)
    X = pd.concat([df[feature_cols], crop_dummies], axis=1)
    y = df[target_col]
    
    # 3. Chronological Train / Val / Test Split
    train_mask = df['year'] <= 2023
    val_mask = df['year'] == 2024
    test_mask = df['year'] >= 2025
    
    X_train, y_train = X[train_mask], y[train_mask]
    X_val, y_val = X[val_mask], y[val_mask]
    X_test, y_test = X[test_mask], y[test_mask]
    
    print(f"\nChronological Split:")
    print(f"  Training set   (2016-2023): {len(X_train)} samples ({len(X_train)/len(X)*100:.1f}%)")
    print(f"  Validation set (2024):      {len(X_val)} samples ({len(X_val)/len(X)*100:.1f}%)")
    print(f"  Holdout Test   (2025-2026): {len(X_test)} samples ({len(X_test)/len(X)*100:.1f}%)")
    
    # 4. Models to benchmark
    models = {
        'Naive_Lag1': None,
        'Rolling_Mean_3': None,
        'Ridge_Regression': Ridge(alpha=10.0),
        'Hist_Gradient_Boosting': HistGradientBoostingRegressor(max_iter=150, max_depth=6, min_samples_leaf=20, random_state=42),
        'Random_Forest': RandomForestRegressor(n_estimators=100, max_depth=12, min_samples_leaf=10, random_state=42, n_jobs=-1)
    }
    
    results = []
    trained_estimators = {}
    
    for name, model in models.items():
        print(f"\nEvaluating: {name}...")
        if name == 'Naive_Lag1':
            preds_val = df.loc[val_mask, 'lag_1']
            preds_test = df.loc[test_mask, 'lag_1']
        elif name == 'Rolling_Mean_3':
            preds_val = df.loc[val_mask, 'rolling_mean_3']
            preds_test = df.loc[test_mask, 'rolling_mean_3']
        else:
            model.fit(X_train, y_train)
            preds_val = model.predict(X_val)
            preds_test = model.predict(X_test)
            trained_estimators[name] = model
            
        # Metrics on Holdout Test Set (2025-2026)
        mae = mean_absolute_error(y_test, preds_test)
        rmse = np.sqrt(mean_squared_error(y_test, preds_test))
        mape = mean_absolute_percentage_error(y_test, preds_test)
        r2 = r2_score(y_test, preds_test)
        
        # Validation MAE
        mae_val = mean_absolute_error(y_val, preds_val)
        
        results.append({
            'Model': name,
            'Val_MAE': round(float(mae_val), 2),
            'Test_MAE': round(float(mae), 2),
            'Test_RMSE': round(float(rmse), 2),
            'Test_MAPE_%': round(float(mape), 2),
            'Test_R2': round(float(r2), 4)
        })
        
    results_df = pd.DataFrame(results)
    print("\n" + "=" * 70)
    print("MODEL COMPARISON (CHRONOLOGICAL HOLDOUT TEST: 2025-2026)")
    print("=" * 70)
    print(results_df.to_string(index=False))
    
    # 5. Select best model based on Test RMSE
    best_row = results_df.sort_values(by='Test_RMSE').iloc[0]
    best_name = best_row['Model']
    print(f"\nBest Model Selected: {best_name} (Test RMSE: {best_row['Test_RMSE']}, Test R2: {best_row['Test_R2']})")
    
    # 6. Save Model Artifacts
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
    os.makedirs(output_dir, exist_ok=True)
    
    model_artifact = {
        'best_model_name': best_name,
        'model': trained_estimators.get(best_name),
        'feature_cols': list(X.columns),
        'base_feature_cols': feature_cols,
        'crop_categories': list(df['Crop'].unique()),
        'rmse': float(best_row['Test_RMSE']),
        'mae': float(best_row['Test_MAE']),
        'mape': float(best_row['Test_MAPE_%']),
        'r2': float(best_row['Test_R2'])
    }
    
    model_path = os.path.join(output_dir, "price_forecast_model.joblib")
    joblib.dump(model_artifact, model_path)
    print(f"Model saved to: {model_path}")
    
    metrics_path = os.path.join(output_dir, "evaluation_metrics.json")
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump({
            'metrics_table': results,
            'best_model': best_name,
            'train_range': '2016-10 to 2023-12',
            'val_range': '2024-01 to 2024-12',
            'test_range': '2025-01 to 2026-09'
        }, f, indent=2)
    print(f"Evaluation metrics saved to: {metrics_path}")
    
    return results_df, model_artifact

if __name__ == '__main__':
    train_and_evaluate_models()
