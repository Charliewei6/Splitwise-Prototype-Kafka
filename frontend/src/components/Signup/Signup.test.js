import {render,screen,fireEvent} from '@testing-library/react';
import Signup from './Signup';
import { Provider } from 'react-redux';
import store from '../../store';

test('test for Signup name', () => {
    render(<Provider store={store}><Signup/></Provider>);
    const inputBox = screen.getByTestId('Signup-name');
    fireEvent.change(inputBox,{target:{value:'xichao'}});
    expect(inputBox.value).toBe('xichao')
});

test('test for Signup email', () => {
    render(<Provider store={store}><Signup/></Provider>);
    const inputBox = screen.getByTestId('Signup-email');
    fireEvent.change(inputBox,{target:{value:'xichao@gmail.com'}});
    expect(inputBox.value).toBe('xichao@gmail.com')
});

test('test for Signup password', () => {
    render(<Provider store={store}><Signup/></Provider>);
    const inputBox = screen.getByTestId('Signup-password');
    fireEvent.change(inputBox,{target:{value:'12345abcd'}});
    expect(inputBox.value).toBe('12345abcd')
});