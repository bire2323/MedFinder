<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\DrugController;
use App\Http\Controllers\ChatSessionController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\MessageStatusController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\RouteController;
use Illuminate\Support\Facades\Broadcast;

use App\Models\Hospital;
use App\Models\Pharmacy;
use Illuminate\Support\Facades\Http;


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

Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get("/auth/google/callback", [AuthController::class, "handleGoogleCallback"]);

// Forgot password - request OTP
Route::post('/forgot-password', [UserController::class, 'forgotPassword']);
// Reset password - verify OTP + set new password
Route::post('/user-reset-password/verify-otp', [UserController::class, 'verifyUserResttingPasswordOtp']);
Route::post('/reset-password', [UserController::class, 'resetPassword']);

// Public search endpoints (by lat/lng & optional radius)
Route::get('search/hospitals', [HospitalController::class, 'searchByLocation']);
Route::get('search/pharmacies', [PharmacyController::class, 'searchByLocation']);

Route::get('/medical-facilities', function () {

    $hospitals = Hospital::with('addresses')
        ->where('status', 'APPROVED')
        ->get()
        ->map(function ($item) {
            $item->type = 'hospital';
            $item->global_id = 'h-' . $item->id;

            return $item->toArray();
        });

    $pharmacies = Pharmacy::with('addresses')
        ->where('status', 'APPROVED')
        ->get()
        ->map(function ($item) {
            $item->type = 'pharmacy';
            $item->global_id = 'p-' . $item->id;

            return $item->toArray();
        });

    return response()->json([
        'success' => true,
        'data' => $hospitals->concat($pharmacies)
    ]);
});
Route::get('/top-medical-facilities', function () {
    $hospitals = Hospital::with('addresses')->where('status', 'APPROVED')->limit(6)->get()->map(function ($item) {
        $item->type = 'hospital';
        $item->global_id = 'h-' . $item->id;


        return $item;
    });

    $pharmacies = Pharmacy::with('addresses')->where('status', 'APPROVED')->limit(6)->get()->map(function ($item) {
        $item->type = 'pharmacy';
        $item->global_id = 'p-' . $item->id;

        return $item;
    });

    return response()->json(['success' => true, 'data' => $hospitals->concat($pharmacies)]);
});

// Public read-only resources
Route::get('hospitals', [HospitalController::class, 'index']);
Route::get('hospitals/{hospital}', [HospitalController::class, 'show']);
Route::get('pharmacies', [PharmacyController::class, 'index']);
Route::get('pharmacies/{pharmacy}', [PharmacyController::class, 'show']);
Route::get('drugs', [DrugController::class, 'index']);
Route::get('drugs/{drug}', [DrugController::class, 'show']);
Route::get('pharmacy/inventory/medicines/search', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'searchMedicine']);


Route::get('/pharmacies', [PharmacyController::class, 'botIndex']);
Route::get('/hospitals', [HospitalController::class, 'botIndex']);
Route::middleware("auth:sanctum")->group(function () {
    Route::post('pharmacy/profile/{pharmacy}', [PharmacyController::class, 'updateProfile']);
    Route::post('hospital/profile/{hospital}', [HospitalController::class, 'updateProfile']);

});

// Routing & Smart Pharmacy Search
Route::get('route', [RouteController::class, 'getRoute']);
Route::get('/map/route', [MapController::class, 'getRoute']);
Route::get('smart-pharmacy', [RouteController::class, 'smartPharmacy']);
Route::prefix('ai')->middleware('auth:sanctum')->group(function () {

    // Triage
    Route::post('/triage', function (Request $request) {
        $response = Http::post('http://localhost:8000/triage', [
            'symptoms' => $request->input('symptoms'),
        ]);

        return $response->json();
    });

    // Drug info
    Route::post('/drug-info', function (Request $request) {
        $response = Http::post('http://localhost:8000/drug-info', [
            'question' => $request->input('question'),
        ]);

        return $response->json();
    });

    // Prescription (file upload)
    Route::post('/prescription', function (Request $request) {
        $file = $request->file('file');

        $response = Http::attach(
            'file',
            file_get_contents($file->path()),
            $file->getClientOriginalName()
        )->post('http://localhost:8000/prescription');

        return $response->json();
    });

    // Facility intent
    Route::post('/facility-intent', function (Request $request) {
        $response = Http::post('http://localhost:8000/facility-intent', [
            'message' => $request->input('message'),
        ]);

        return $response->json();
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('pharmacy-agent/profile', [PharmacyController::class, 'getPharmaProfile']);
    Route::post('profile/update', [AuthController::class, 'updateProfile']);
    Route::post('profile/password-update', [AuthController::class, 'updatePassword']);
    Route::get('user', [AuthController::class, 'user']);
    Route::post('user/heartbeat', \App\Http\Controllers\HeartbeatController::class);

    Route::get('chat/sessions', [ChatSessionController::class, 'index']);
    Route::post('chat/sessions', [ChatSessionController::class, 'store']);
    Route::get('chat/sessions/{session}/messages', [ChatMessageController::class, 'index']);
    Route::post('chat/sessions/{session}/message', [ChatMessageController::class, 'store']);
    Route::post('chat/sessions/{session}/read', [ChatMessageController::class, 'markAsRead']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/chat/sessions/{sessionId}/mark-delivered', [MessageStatusController::class, 'markDelivered']);
    Route::post('/chat/sessions/{sessionId}/mark-read', [MessageStatusController::class, 'markRead']);
});
Route::get('admin/stats', [\App\Http\Controllers\AdminDashboardController::class, 'stats']);
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

    Route::get('/auditlogs', [UserController::class, 'auditLogs']);

    // Drugs
    Route::post('drugs', [DrugController::class, 'store']);
    Route::put('drugs/{drug}', [DrugController::class, 'update']);
    Route::patch('drugs/{drug}', [DrugController::class, 'update']);
    Route::delete('drugs/{drug}', [DrugController::class, 'destroy']);

    Route::prefix('pharmacy/inventory')->group(function () {

        Route::get('/', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'getInventory']);

        Route::get('analytics', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'getAnalytics']);
        Route::get('trash', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'getTrash']);
        Route::get('history', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'getStockHistory']);
        Route::get('{drug}', [DrugController::class, 'show']);
        Route::post('/', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'addDrug']);
        Route::put('{inventory}', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'update']);
        Route::delete('{inventory}', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'deleteDrug']);
        Route::post('{inventory}/restore', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'restoreDrug']);
        Route::Patch('{inventory}/toggle-availability', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'toggleAvailability']);
    });



    // Inventories (uses PharmacyDrugInventoryController)


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
    Route::post('detectIntent', [UserController::class, 'detectIntent']);

    // Admin Approval & Management Routes
    Route::prefix('admin')->group(function () {
        // Approvals (Facilities)
        Route::get('approvals', [\App\Http\Controllers\AdminApprovalController::class, 'index']);
        Route::post('approvals/{id}', [\App\Http\Controllers\AdminApprovalController::class, 'decide']);


        // Dashboard Stats & Management
        Route::get('users', [\App\Http\Controllers\AdminDashboardController::class, 'users']);
        Route::put('users/{user}', [\App\Http\Controllers\AdminDashboardController::class, 'updateUser']);
        Route::get('notifications', [\App\Http\Controllers\AdminDashboardController::class, 'notifications']);
        Route::post('notifications/{notification}/read', [\App\Http\Controllers\AdminDashboardController::class, 'markRead']);
    });

    // Auth actions
    Route::post('logout', [AuthController::class, 'logout']);
});

// Fallback route for API
Route::fallback(function () {
    return response()->json(['message' => 'Not Found.'], 404);
});






Route::get('/bot/search-drug', [\App\Http\Controllers\PharmacyDrugInventoryController::class, "botSearchMedicine"]);