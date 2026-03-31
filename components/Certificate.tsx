export default function Certificate({ name, course }) {
  return (
    <div 
      id="certificate"
      className="w-[800px] h-[600px] border p-10 text-center bg-white"
    >
      <h1 className="text-4xl font-bold">Certificate</h1>
      <p className="mt-6">This certifies that</p>
      <h2 className="text-3xl font-semibold">{name}</h2>
      <p>has completed</p>
      <h3 className="text-xl">{course}</h3>
    </div>
  );
}