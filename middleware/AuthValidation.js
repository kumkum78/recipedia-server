import Joi from 'joi';

const signupValidation=(req,res,next)=>{
  const schema = Joi.object({
    username: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(100).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};

const loginValidation=(req,res,next)=>{
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(100).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};

export { signupValidation, loginValidation };


// Note: The above code is a middleware for validating user registration and login requests using Joi. It checks the request body against defined schemas and returns an error if validation fails. If validation passes, it calls the next middleware or route handler.