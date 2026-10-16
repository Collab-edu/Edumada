<?php

namespace App\Enums;

use ValueError;

/**
 * Libellés affichés sur le site pour un enum à valeur texte.
 * La valeur (code stable) est stockée en base ; le libellé est celui qu'attend le frontend.
 */
trait HasLabel
{
    abstract public function label(): string;

    /**
     * Retrouve un cas à partir de son libellé (import des données du site).
     */
    public static function fromLabel(string $label): self
    {
        foreach (self::cases() as $case) {
            if ($case->label() === $label) {
                return $case;
            }
        }

        throw new ValueError(sprintf('"%s" n\'est pas un libellé valide pour %s.', $label, self::class));
    }

    /**
     * Libellés acceptés par l'API, dans l'ordre des cas.
     *
     * @return list<string>
     */
    public static function labels(): array
    {
        return array_map(fn (self $case) => $case->label(), self::cases());
    }

    /**
     * Libellé → cas, ou null si le libellé est vide.
     */
    public static function fromNullableLabel(?string $label): ?self
    {
        return $label === null || $label === '' ? null : self::fromLabel($label);
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
