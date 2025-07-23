import ReviewProdukDetailPage from './ReviewProdukDetailPage';

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ReviewProdukDetailPage params={{ id }} />;
}