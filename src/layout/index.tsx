import { Outlet } from 'react-router-dom'
import Header from './header'
import Footer from './footer'

export default ()=>{
    return (
        <>
			<Header />
			<main className='pt-12'>
				<Outlet />
			</main>
            <Footer />
        </>
    )
}
