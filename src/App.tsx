import React, { Suspense } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routers'

//@ts-ignore
const router = createBrowserRouter(routes, {
	basename: "/"
});

function App() {
	return (
		<Suspense fallback={<div></div>}>
			<RouterProvider router={router} />
		</Suspense>

  )
}

export default App
