
export default function Home({data}) {
  return (
    <>
    <h1>partial home</h1>
    <button >Click me</button>
    </>
  );
}
export async function getServerSideProps() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await res.json(); 
    return {
      props: {
        data,
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      props: {
        data: [],
      },
    };
  }
}


