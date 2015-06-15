var bcrypt = require('bcrypt-nodejs');

/* The UsersDAO must be constructed with a connected database object */
function UsersDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof UsersDAO)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersDAO(db);
    }

    var users = db.collection("users");

    this.addUser = function(username, password, email, callback) {
        "use strict";

        // Generate password hash
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);

        // Create user document
        var user = {'_id': username, 'password': password_hash};

        // Add email if set
        if (email != "") {
            user['email'] = email;
        }

        // TODO: hw2.3
        users.insert(user, function (err, result) {
            "use strict";
            callback(err, result[0]);
        });
    }

    this.validateLogin = function(username, password, callback) {
        "use strict";
        function validateUserDoc(err, user) {                       
            "use strict";
            if (err) return callback(err, null);
            if (user) { if (bcrypt.compareSync(password, user.password)) { callback(null, user); }
                        else {var invalid_password_error = new Error("Invalid password");
                              invalid_password_error.invalid_password = true; callback(invalid_password_error, null); } 
            }
            else { var no_such_user_error = new Error("User: " + user + " does not exist");
                no_such_user_error.no_such_user = true; callback(no_such_user_error, null); 
            }
        }
        // TODO: hw2.3 
        users.findOne({ '_id' : username }, validateUserDoc); 
    }
}

module.exports.UsersDAO = UsersDAO;
