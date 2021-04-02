import {render,screen,fireEvent} from '@testing-library/react';
import Navbar from './Navbar';
import { Provider } from 'react-redux';
import store from '../../store';

test('test for Navbar', () => {
    render(<Provider store={store}><Navbar/></Provider>);
    const text=screen.getByText(/Splitwise/i)
    expect(text).toBeInTheDocument()
});
test('test for Navbar', () => {
    const handleClick = jest.fn()
    render(<Provider store={store}><Navbar/></Provider>);
    fireEvent.click(screen.getByText(/Login/i))
    expect(handleClick).toHaveBeenCalledTimes(0)
});