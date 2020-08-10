const commonReducer = (
    state = {
    },
    action
) => {
    switch(action.type) {
        case 'COMMON/TEST':
            return  {
                ...state
            }
        default:
            return state
    }
}

export default commonReducer;