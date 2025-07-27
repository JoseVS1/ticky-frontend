export const Errors = ({errors}) => {
    console.log(errors)
    return (
      <div>
          <ul>
              {errors.map((error, i) => (
                  <li className="error" key={i}>{error.message}</li>
              ))}
          </ul>
      </div>
    )
  }