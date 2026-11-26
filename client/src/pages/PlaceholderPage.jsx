import Card from '../components/ui/Card'

export default function PlaceholderPage({ title, description }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <Card className="mt-6">
        <p className="text-slate-600">{description}</p>
      </Card>
    </div>
  )
}
