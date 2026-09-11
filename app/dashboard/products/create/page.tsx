import { redirect } from 'next/navigation';

export default function DashboardProductsCreateRedirect() {
  redirect('/dashboard/products/new');
}
