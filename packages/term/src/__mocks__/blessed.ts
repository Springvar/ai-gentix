const mockElement = {
    append: jest.fn(),
    setContent: jest.fn(),
    getContent: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    destroy: jest.fn(),
    focus: jest.fn(),
    render: jest.fn(),
    on: jest.fn(),
    add: jest.fn(),
    removeItem: jest.fn(),
};

const mockScreen = {
    ...mockElement,
    key: jest.fn(),
    emit: jest.fn(),
};

export const screen = jest.fn(() => mockScreen);
export const box = jest.fn(() => mockElement);
export const list = jest.fn(() => mockElement);

export default {
    screen,
    box,
    list,
};