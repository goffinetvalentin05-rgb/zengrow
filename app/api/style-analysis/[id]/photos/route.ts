import { handleConfirmPhotos, handleDeletePhotos } from "@/src/lib/fitme/handlers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  return handleConfirmPhotos(request, id);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return handleDeletePhotos(id);
}
