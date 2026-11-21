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
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('accommodations', AccommodationController::class);
    Route::apiResource('itineraries', ItineraryController::class);
    Route::apiResource('steps', StepController::class);
    Route::apiResource('activities', ActivityController::class);
});