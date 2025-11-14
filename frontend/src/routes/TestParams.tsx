import { useParams } from 'react-router-dom';

const TestParams = () => {
  const params = useParams();
  console.log('TestParams.tsx: useParams() output:', params);

  return (
    <div>
      <h1>Test Params Component</h1>
      <p>Params: {JSON.stringify(params)}</p>
    </div>
  );
};

export default TestParams;
