<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Brochure PDF d'une offre : envoyée depuis le back-office, téléchargeable sur le site.
 */
class DocumentUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_establishment_uploads_a_pdf_brochure(): void
    {
        Storage::fake('public');
        [$owner] = $this->establishmentOwner();

        $response = $this->actingAs($owner)->postJson('/api/v1/uploads/documents', [
            'file' => UploadedFile::fake()->create('brochure.pdf', 500, 'application/pdf'),
        ]);

        $response->assertCreated()->assertJsonPath('name', 'brochure.pdf');
        $path = str_replace(Storage::disk('public')->url(''), '', $response->json('url'));
        Storage::disk('public')->assertExists($path);
    }

    public function test_rejects_other_file_types_and_students(): void
    {
        Storage::fake('public');
        [$owner] = $this->establishmentOwner();

        $this->actingAs($owner)->postJson('/api/v1/uploads/documents', [
            'file' => UploadedFile::fake()->create('virus.exe', 10, 'application/octet-stream'),
        ])->assertUnprocessable()->assertJsonValidationErrors('file');

        $this->actingAs($this->student())->postJson('/api/v1/uploads/documents', [
            'file' => UploadedFile::fake()->create('brochure.pdf', 10, 'application/pdf'),
        ])->assertForbidden();
    }
}
