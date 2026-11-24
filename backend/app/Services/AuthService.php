<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class AuthService
{
    public function register(array $data): array
    {
        $userAttributes = [
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ];

        if (Schema::hasColumn('users', 'nom')) {
            $userAttributes['nom'] = $data['nom'];
        }

        if (Schema::hasColumn('users', 'name')) {
            $userAttributes['name'] = $data['nom'] ?? ($data['name'] ?? '');
        }

        $user = User::create($userAttributes);
        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new AuthenticationException('Identifiants incorrects.');
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}