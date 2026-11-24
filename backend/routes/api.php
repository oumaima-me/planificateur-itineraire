<?php

use App\Http\Controllers\Api\AccommodationController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ItineraryController;
use App\Http\Controllers\Api\StepController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user(), 200);
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('itineraries/{itinerary}/summary', [ItineraryController::class, 'summary']);
    Route::apiResource('itineraries', ItineraryController::class);
    Route::apiResource('steps', StepController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('activities', ActivityController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('accommodations', AccommodationController::class)->only(['store', 'update', 'destroy']);
});