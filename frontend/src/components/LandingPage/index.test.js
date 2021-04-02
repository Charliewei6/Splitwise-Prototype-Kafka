import {render,screen,fireEvent} from '@testing-library/react';
import Index from './index';
import { Provider } from 'react-redux';
import store from '../../store';


test('test for Landing Page', () => {
    render(<Provider store={store}><Index/></Provider>);
    const text=screen.getByText(/sharing expenses/i)
    expect(text).toBeInTheDocument()
});
test('test for Landing Page', () => {
    const handleClick = jest.fn()
    render(<Provider store={store}><Index/></Provider>);
    fireEvent.click(screen.getByText(/Sign Up/i))
    expect(handleClick).toHaveBeenCalledTimes(0)
});