import {render,screen,fireEvent} from '@testing-library/react';
import Index from './index';
import { Provider } from 'react-redux';
import store from '../../store';

import {BrowserRouter} from 'react-router-dom';

test('test for Landing Page', () => {
    render(<Provider store={store}><BrowserRouter><Index/></BrowserRouter></Provider>);
    const text=screen.getByText(/sharing expenses/i)
    expect(text).toBeInTheDocument()
});
test('test for Landing Page', () => {
    const handleClick = jest.fn()
    render(<Provider store={store}><BrowserRouter><Index/></BrowserRouter></Provider>);
    fireEvent.click(screen.getByText(/Sign Up/i))
    expect(handleClick).toHaveBeenCalledTimes(0)
});