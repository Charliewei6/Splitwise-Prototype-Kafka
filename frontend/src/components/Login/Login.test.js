import {render,screen,fireEvent} from '@testing-library/react';
import Login from './Login';
import { Provider } from 'react-redux';
import store from '../../store';

test('test for login email', () => {
    render(<Provider store={store}><Login/></Provider>);
    const inputBox = screen.getByTestId('login-email');
    fireEvent.change(inputBox,{target:{value:'xichao@gmail.com'}});
    expect(inputBox.value).toBe('xichao@gmail.com')
});

test('test for login password', () => {
    render(<Provider store={store}><Login/></Provider>);
    const inputBox = screen.getByTestId('login-password');
    fireEvent.change(inputBox,{target:{value:'12345'}});
    expect(inputBox.value).toBe('12345')
});
