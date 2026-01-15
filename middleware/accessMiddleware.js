
import jwt from "jsonwebtoken";
import { addEmployees } from "../model/addEmployeeSchema.js";

export const sectionAccess = async (req, res, next) => {
    try {
      
      const accessToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
      
      if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_REFRESH_SECRET
      );
      
      const email = decoded.role; 
      
      const employee = await addEmployees.findOne({ email });

      // agar employee nahi mila → ADMIN
      if (!employee) {
        return  res.json({ success: true, message: "Access section admin", url: "admin", });
      }

      const { section } = req.body
      if(!section) return res.status(403).json({ employeeData: employee, message: "Access section employees" });
      
      // section based access
      if (employee.access?.[section]?.sectionaccess === true) {
        return  res.json({ success: true, message: "Access section employees", employeeData: employee, urlsection: section  });
      }

      return res.status(403).json({ message: "Access denied", employeeData: employee});
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid Token" });
    }
  };

 