export const MajorButton = (props) => {
    return (
        <button onClick={props.onClick} className="button button--pan"><span>{props.text}</span></button>
    )
}