export default function Label({ value }: { value: number | string }) {
  return <button className={"label"}> {value} </button>;
}
