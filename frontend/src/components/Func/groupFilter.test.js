import {render,screen,fireEvent} from '@testing-library/react';
import GroupFilter from './GroupFilter';
import { Provider } from 'react-redux';
import store from '../../store';

test('test for recent', () => {
    render(<Provider store={store}><GroupFilter/></Provider>);
    const text=screen.getByText(/Allgroup/i)
    expect(text).toBeInTheDocument()
});