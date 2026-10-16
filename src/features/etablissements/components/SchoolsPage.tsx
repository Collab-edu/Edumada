"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/form";
import SectionHeader from "@/components/ui/section-header";
import { CardSkeletonGrid } from "@/components/ui/card";
import { useSiteData } from "@/data/site-data";
import SuggestInput from "@/features/recherche/components/SuggestInput";
import { FILTER_UI } from "@/features/recherche/useFilterSuggestions";
import SchoolCard from "./SchoolCard";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=70";

const BENEFITS = [
  {
    icon: "tabler:id-badge-2",
    title: "Des fiches complètes",
    text: "Présentation, formations proposées, conditions d’admission et pièces à fournir, au même endroit.",
  },
  {
    icon: "tabler:rosette-discount-check",
    title: "Une reconnaissance indiquée",
    text: "Vérifiez sur chaque fiche le statut de vérification et la reconnaissance déclarée par l’établissement.",
  },
  {
    icon: "tabler:message-circle",
    title: "Un contact direct",
    text: "Écrivez ou appelez l’établissement depuis sa fiche, sans intermédiaire.",
  },
];

/** Valeurs distinctes triées, avec le nombre d'établissements correspondants. */
const toSuggestions = (values: string[]) =>
  [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((value) => {
      const count = values.filter((v) => v === value).length;
      return { value, hint: `${count} établissement${count > 1 ? "s" : ""}` };
    });

/** Liste de tous les établissements, filtrable par catégorie et par ville. */
export default function SchoolsPage() {
  const { data: schools, loading } = useSiteData("SchoolData");
  const { data: categories } = useSiteData("CategoryData");
  const [filters, setFilters] = useState({ category: "", city: "" });

  const categoryLabel = useMemo(() => {
    const labels = new Map(categories.map((c) => [c.id, c.shortLabel]));
    return (id: string) => labels.get(id) ?? "";
  }, [categories]);
  const categorySuggestions = useMemo(
    () => toSuggestions(schools.map((s) => categoryLabel(s.category))),
    [schools, categoryLabel],
  );
  const citySuggestions = useMemo(
    () => toSuggestions(schools.map((s) => s.city)),
    [schools],
  );
  const shown = schools.filter(
    (s) =>
      (!filters.category || categoryLabel(s.category) === filters.category) &&
      (!filters.city || s.city === filters.city),
  );
  const filtered = !!(filters.category || filters.city);

  return (
    <>
      {/* En-tête de page */}
      <section className="pt-28 pb-10 sm:pt-32">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="flex max-w-3xl flex-col gap-4">
              <p className="font-semibold uppercase tracking-wide text-primary">
                Établissements
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-secondary">
                Trouvez l&apos;établissement qui vous correspond
              </h1>
              <p className="text-ink/70">
                Universités, écoles, crèches et centres de formation à
                Madagascar : consultez leur fiche, découvrez les formations
                qu&apos;ils proposent, puis contactez-les directement.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/recherche/">
                  <Icon icon="tabler:search" className="text-lg" />
                  Rechercher une formation
                </ButtonLink>
                <ButtonLink
                  href="/signup/?type=etablissement"
                  variant="secondary"
                >
                  Référencer mon établissement
                </ButtonLink>
              </div>
            </div>
            <div className="relative h-56 overflow-hidden rounded-2xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-72 lg:h-80">
              <Image
                src={HERO_IMAGE}
                alt="Campus d’un établissement d’enseignement"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Établissements */}
      <section>
        <div className="container mx-auto max-w-7xl px-4">
          <SectionHeader
            title="Tous les établissements"
            description="Filtrez par catégorie et par ville pour trouver l’établissement qui correspond à votre projet."
          />
          {/* Filtre : catégorie et localisation */}
          <form
            role="search"
            aria-label="Filtrer les établissements"
            onSubmit={(e) => e.preventDefault()}
            className="mb-6 grid grid-cols-1 gap-2 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)] sm:grid-cols-[1fr_1fr_auto] sm:items-center"
          >
            {[
              {
                key: "category" as const,
                ui: FILTER_UI.categorie,
                label: "Catégorie",
                suggestions: categorySuggestions,
              },
              {
                key: "city" as const,
                ui: FILTER_UI.ville,
                label: "Ville / Localisation",
                suggestions: citySuggestions,
              },
            ].map((field) => (
              <div
                key={field.key}
                className="rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100"
              >
                <SuggestInput
                  icon={field.ui.icon}
                  label={field.label}
                  placeholder={field.ui.placeholder}
                  suggestions={field.suggestions}
                  value={filters[field.key]}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, [field.key]: value }))
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFilters({ category: "", city: "" })}
              disabled={!filtered}
              className="h-11 rounded-lg px-4 text-sm font-semibold text-primary hover:underline disabled:hidden sm:disabled:block sm:disabled:invisible hover:cursor-pointer"
            >
              Réinitialiser
            </button>
          </form>

          {loading ? (
            <CardSkeletonGrid count={8} className="h-[360px]" />
          ) : shown.length === 0 ? (
            <p className="rounded-xl bg-white p-8 text-center text-ink/70">
              {filtered
                ? "Aucun établissement ne correspond à ces critères."
                : "Aucun établissement publié pour le moment."}
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-ink/60" aria-live="polite">
                {shown.length} établissement{shown.length > 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {shown.map((school) => (
                  <SchoolCard key={school.id} school={school} compact />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Atouts */}
      <section className="pt-0">
        <div className="container mx-auto max-w-7xl px-4">
          <ul className="grid gap-4 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <li
                key={b.title}
                className="flex gap-4 rounded-xl bg-white p-5 border border-gray-100"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon icon={b.icon} className="text-2xl" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-secondary">
                    {b.title}
                  </h2>
                  <p className="text-sm text-ink/70">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Appel aux établissements */}
      <section className="pb-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 rounded-2xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Vous dirigez un établissement ?
              </h2>
              <p className="text-white/80">
                Présentez vos formations gratuitement et recevez les demandes
                des futurs élèves et étudiants.
              </p>
            </div>
            <ButtonLink href="/signup/?type=etablissement" className="shrink-0">
              Référencer mon établissement
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
