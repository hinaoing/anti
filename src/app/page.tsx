import { Button } from 'primereact/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">Next.js + PrimeReact</h1>
      <div className="flex gap-4">
        <Button label="Check it out" icon="pi pi-check" />
        <a href="/selection">
          <Button label="Go to Selection" icon="pi pi-list" severity="secondary" />
        </a>
      </div>
    </div>
  );
}
