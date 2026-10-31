<?php

namespace App\Models;

use App\Enums\InternshipApplicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Candidature d'un étudiant à un stage : les documents restent privés (disque local).
 */
class InternshipApplication extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = ['status'];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'new',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => InternshipApplicationStatus::class,
        ];
    }

    public function directory(): string
    {
        return "internship-applications/{$this->id}";
    }

    /**
     * @return BelongsTo<Internship, $this>
     */
    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
