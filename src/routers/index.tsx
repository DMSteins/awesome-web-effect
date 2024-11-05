import { lazy } from 'react'
import Layout from '@/layout/index'
import NotFound from '@/views/404'

const pages = import.meta.glob("../views/*/*.tsx");
const pageRoutes = Object.entries(pages).map(([path, page]) => {
	let componentName = path.replace("../views", "").replace(/.tsx$/, '').toLowerCase()
	if (!componentName) return
	const routePath = componentName === '/home/index' ? '/' : componentName;
	//@ts-ignore
	const Component = lazy(page);
	return {
		path: routePath,
		Component: Component,
	};
})
export const routes = [
	{
		path: '/',
		element: (<Layout />),
		children: [
			...pageRoutes,
			{
				path: '*',
				element: (<NotFound />),
			}
		],
	},
]

