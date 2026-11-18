<?php

use App\Http\Controllers\Api\ItineraryController;
use App\Http\Controllers\Api\StepController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Routes API pour les itinéraires et les étapes
Route::apiResource('itineraries', ItineraryController::class);
Route::apiResource('steps', StepController::class);