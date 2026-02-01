<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\DrugController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\ChatSessionController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\DepartmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| RESTful endpoints for hospitals, pharmacies, drugs, inventory, alerts,
| chat and search-by-location. Controllers should implement methods
| referenced below (standard Laravel controller methods + search handlers).
|
*/

// Public auth
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('resend-otp', [AuthController::class, 'resendOtp']);

// Forgot password - request OTP
Route::post('/forgot-password', [UserController::class, 'forgotPassword']);
// Reset password - verify OTP + set new password
Route::post('/user-reset-password/verify-otp', [UserController::class, 'verifyUserResttingPasswordOtp']);
Route::post('/reset-password', [UserController::class, 'resetPassword']);

// Public search endpoints (by lat/lng & optional radius)
Route::get('search/hospitals', [HospitalController::class, 'searchByLocation']);
Route::get('search/pharmacies', [PharmacyController::class, 'searchByLocation']);



// Public read-only resources
Route::get('hospitals', [HospitalController::class, 'index']);
Route::get('hospitals/{hospital}', [HospitalController::class, 'show']);
Route::get('pharmacies', [PharmacyController::class, 'index']);
Route::get('pharmacies/{pharmacy}', [PharmacyController::class, 'show']);
Route::get('drugs', [DrugController::class, 'index']);
Route::get('drugs/{drug}', [DrugController::class, 'show']);

// Protected routes (require auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Full CRUD (explicit routes)
    Route::post('register/hospital', [HospitalController::class, 'store']);
    Route::post('register/pharmacy', [PharmacyController::class, 'store']);
    // Hospitals
    Route::post('hospitals', [HospitalController::class, 'store']);
    Route::put('hospitals/{hospital}', [HospitalController::class, 'update']);
    Route::patch('hospitals/{hospital}', [HospitalController::class, 'update']);
    Route::delete('hospitals/{hospital}', [HospitalController::class, 'destroy']);

    // Pharmacies
    Route::post('pharmacies', [PharmacyController::class, 'store']);
    Route::put('pharmacies/{pharmacy}', [PharmacyController::class, 'update']);
    Route::patch('pharmacies/{pharmacy}', [PharmacyController::class, 'update']);
    Route::delete('pharmacies/{pharmacy}', [PharmacyController::class, 'destroy']);

    // Drugs
    Route::post('drugs', [DrugController::class, 'store']);
    Route::put('drugs/{drug}', [DrugController::class, 'update']);
    Route::patch('drugs/{drug}', [DrugController::class, 'update']);
    Route::delete('drugs/{drug}', [DrugController::class, 'destroy']);

    // Inventories (uses PharmacyDrugInventoryController)
    Route::get('inventories', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'index']);
    Route::post('inventories', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'store']);
    Route::get('inventories/{inventory}', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'show']);
    Route::put('inventories/{inventory}', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'update']);
    Route::patch('inventories/{inventory}', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'update']);
    Route::delete('inventories/{inventory}', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'destroy']);

    // Alerts (uses LowStockExpirationAlertController)
    Route::get('alerts', [\App\Http\Controllers\LowStockExpirationAlertController::class, 'index']);
    Route::post('alerts', [\App\Http\Controllers\LowStockExpirationAlertController::class, 'store']);
    Route::get('alerts/{alert}', [\App\Http\Controllers\LowStockExpirationAlertController::class, 'show']);
    Route::put('alerts/{alert}', [\App\Http\Controllers\LowStockExpirationAlertController::class, 'update']);
    Route::patch('alerts/{alert}', [\App\Http\Controllers\LowStockExpirationAlertController::class, 'update']);
    Route::delete('alerts/{alert}', [\App\Http\Controllers\LowStockExpirationAlertController::class, 'destroy']);

    // Locations
    Route::get('locations', [LocationController::class, 'index']);
    Route::post('locations', [LocationController::class, 'store']);
    Route::get('locations/{location}', [LocationController::class, 'show']);
    Route::put('locations/{location}', [LocationController::class, 'update']);
    Route::patch('locations/{location}', [LocationController::class, 'update']);
    Route::delete('locations/{location}', [LocationController::class, 'destroy']);

    // Services
    Route::get('services', [ServiceController::class, 'index']);
    Route::post('services', [ServiceController::class, 'store']);
    Route::get('services/{service}', [ServiceController::class, 'show']);
    Route::put('services/{service}', [ServiceController::class, 'update']);
    Route::patch('services/{service}', [ServiceController::class, 'update']);
    Route::delete('services/{service}', [ServiceController::class, 'destroy']);

    // Departments
    Route::get('departments', [DepartmentController::class, 'index']);
    Route::post('departments', [DepartmentController::class, 'store']);
    Route::get('departments/{department}', [DepartmentController::class, 'show']);
    Route::put('departments/{department}', [DepartmentController::class, 'update']);
    Route::patch('departments/{department}', [DepartmentController::class, 'update']);
    Route::delete('departments/{department}', [DepartmentController::class, 'destroy']);

    // Chat endpoints
    Route::post('chat', [ChatSessionController::class, 'chat']);
    Route::get('chats', [ChatSessionController::class, 'index']);
    Route::post('chats', [ChatSessionController::class, 'store']);
    Route::get('chats/{chat}', [ChatSessionController::class, 'show']);
    Route::delete('chats/{chat}', [ChatSessionController::class, 'destroy']);

    // Convenience / relationship endpoints
    Route::get('hospitals/{hospital}/departments', [HospitalController::class, 'departments']);
    Route::get('pharmacies/{pharmacy}/drugs', [PharmacyController::class, 'drugs']);

    // Auth actions
    Route::post('logout', [AuthController::class, 'logout']);
});

// Fallback route for API
Route::fallback(function () {
    return response()->json(['message' => 'Not Found.'], 404);
});
