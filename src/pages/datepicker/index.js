import { AiOutlineInfoCircle } from "react-icons/ai";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import CustomTooltip from "./CustomTooltip";

const UniversalDatePicker = ({
    id,
    name,
    label,
    value,
    onChange,
    // placeholder = '',
    // tooltipContent = '',
    // tooltipPlacement = 'top',
    // error = false,
    errorText = '',
    minDate,
    maxDate,
    defaultValue,
    views,
     disabled = false 
}) => {
    return (
        <div className=''>
            <LocalizationProvider dateAdapter={AdapterDateFns} className="h-5 bg-slate-500" >
              
                <DatePicker
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    views={views}
                    
                    defaultValue={defaultValue || null}
                    format="dd-MM-yyyy"
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            // placeholder,
                            variant: "outlined",
                            disabled: disabled,
                            InputProps: {
                                style: {
                                    backgroundColor: "#fff",
                                    borderRadius: 6,
                                    fontSize: "0.95rem",
                                    height: "38px",
                                    boxShadow: "0px 0px 1px rgba(0, 0, 0, 0.3)",
                                },
                            },
                            InputLabelProps: {
                                shrink: true,
                            },
                        },
                    }}
                />
            </LocalizationProvider>
        </div>
    );
};

export default UniversalDatePicker;
