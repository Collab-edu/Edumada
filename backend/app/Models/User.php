<?php

namespace App\Models;

use App\Enums\EstablishmentMemberRole;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Compte Edumada : étudiant, représentant d'établissement ou administrateur.
 * Le rôle n'est jamais rempli depuis une requête : voir RegisterController.
 */
#[Fillable(['name', 'first_name', 'last_name', 'job_title', 'email', 'password', 'phone', 'city', 'study_level'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Identité du responsable, renseignée seulement à l'inscription d'un établissement.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'first_name' => null,
        'last_name' => null,
        'job_title' => null,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    /**
     * Établissements que l'utilisateur représente.
     *
     * @return BelongsToMany<Establishment, $this>
     */
    public function establishments(): BelongsToMany
    {
        return $this->belongsToMany(Establishment::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany<Offer, $this>
     */
    public function favoriteOffers(): BelongsToMany
    {
        return $this->belongsToMany(Offer::class, 'favorites')->withTimestamps();
    }

    /**
     * Demandes et candidatures envoyées par l'étudiant.
     *
     * @return HasMany<Inquiry, $this>
     */
    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::Student;
    }

    public function isEstablishmentAccount(): bool
    {
        return $this->role === UserRole::Establishment;
    }

    /**
     * L'utilisateur fait-il partie de l'équipe de cet établissement ?
     */
    public function managesEstablishment(Establishment $establishment): bool
    {
        return $this->establishments()->whereKey($establishment->getKey())->exists();
    }

    public function ownsEstablishment(Establishment $establishment): bool
    {
        return $this->establishments()
            ->whereKey($establishment->getKey())
            ->wherePivot('role', EstablishmentMemberRole::Owner->value)
            ->exists();
    }
}
