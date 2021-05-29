package ch.zhaw.infoM.project4.src;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import com.opencsv.CSVReader;

public class Main {

	public static void main(String[] args) throws IOException, NumberFormatException, ParseException, InterruptedException {
		System.out.println("> Information Management: Project 4 - Data Source Integration");
		
		List companies = Main.readCompaniesFromCsv();
		List pensionFunds = Main.readPensionFundFromCsv();
		List employees = Main.readEmployeesFromCsv(companies, pensionFunds);
		
		System.out.println("> Statistic" + "\n" + 
						   "  > Companies: " + companies.size() + "\n" + 
						   "  > Pensions funds: " + pensionFunds.size() + "\n" + 
						   "  > registered employees: " + employees.size()
						  );
		
		String pfad = "C:\\Users\\yluet\\OneDrive - ZHAW\\Bachelor\\Wirtschaftsinformatik\\ZHAW-Code\\4_Semester\\1_InfoM\\Tasks\\Project 4 - Data Source Integration\\WP3\\"; 
		
		Main.createSqlInsertFiles(companies
								 ,"INSERT INTO infom_project_4.company (pk_companyId, name, industry)" + "\n" + "VALUES" + "\n"
								 ,"company.sql"
								 ,pfad
								 );
		
		
		Main.createSqlInsertFiles(pensionFunds
				 				 ,"INSERT INTO infom_project_4.pensionFund (pk_pensionFundId, name, prize)" + "\n" + "VALUES" + "\n"
				 				 ,"pensionFund.sql"
				                 ,pfad
				                 );  
		
		Main.createSqlInsertFiles(employees
								 ,"INSERT INTO infom_project_4.employee (pk_employeeId, name, salary, birthdate, hiredSince, fk_companyId, fk_pensionFundId)" + "\n" + "VALUES" + "\n"
								 ,"employees.sql"
				                 ,pfad
				                 );  
	}
	
	public static List<Company> readCompaniesFromCsv() throws IOException {
		//File with correct amount of companies for employee lists
		//CSVReader reader = new CSVReader(new FileReader("resources/InfoM-Project4-Company.csv"));
		
		//File with less companies for Exception Handling!!!
		CSVReader reader = new CSVReader(new FileReader("resources/InfoM-Project4-Company_ERROR.csv"));

		//read first line = Column titles
		String[] line = reader.readNext();
		
		List<Company> companies = new ArrayList<Company>();
		
		while((line = reader.readNext()) != null) {
			companies.add(new Company(Integer.parseInt(line[0]), line[1], line[2]));
		}

		System.out.println(companies.size());
		return companies;
	}
	
	public static List<PensionFund> readPensionFundFromCsv() throws IOException {
		//File with correct amount of pension funds for employee lists
		//CSVReader reader = new CSVReader(new FileReader("resources/InfoM-Project4-PensionFund.csv"));
		
		//File with less pension funds for Exception Handling!!!
		CSVReader reader = new CSVReader(new FileReader("resources/InfoM-Project4-PensionFund_ERROR.csv"));
		
		//read first line = Column titles
		String[] line = reader.readNext();
		
		List<PensionFund> pensionFunds = new ArrayList<PensionFund>();
		
		while((line = reader.readNext()) != null) {
			pensionFunds.add(new PensionFund(Integer.parseInt(line[0]), line[1], Double.parseDouble(line[2])));
		}

		return pensionFunds;
	}
	
	public static List<Employee> readEmployeesFromCsv(List<Company> companies, List<PensionFund> pensionsFunds) throws IOException, NumberFormatException, ParseException {
		CSVReader reader = new CSVReader(new FileReader("resources/InfoM-Project4-Employee.csv"));
		//read first line = Column titles
		String[] line = reader.readNext();
		
		List<Employee> employees = new ArrayList<Employee>();
		
		boolean employeeIsValid = false;
		boolean isHired = false;
		boolean hasPensionFund = false;
		
		Employee tempEmployee = null;
		
		StringBuilder description; 

		while((line = reader.readNext()) != null) {
			employeeIsValid = true;
			isHired = false;
			hasPensionFund = false;
			description = new StringBuilder();
			
			tempEmployee = new Employee(Integer.parseInt(line[0])
									   ,line[1]
									   ,Double.parseDouble(line[2])
									   ,(line[3])
									   ,Integer.parseInt(line[4])
									   ,Integer.parseInt(line[5])
									   ,Integer.parseInt(line[6])
								       )
					       ;
			
			for (Company current : companies) {
				if (current.getId() == tempEmployee.getIdCompany()) {	
					employeeIsValid = true;
					isHired = true;
					System.out.println(current.getId());
					System.out.println(tempEmployee.getIdCompany());
					break;
				} else {
					employeeIsValid = false;
				}
			}
			
			if(employeeIsValid) {
				for (PensionFund current : pensionsFunds) {
					if (current.getId() == tempEmployee.getIdPensionFund()) {	
						employeeIsValid = true;
						hasPensionFund = true;
						break;
					} else {
						employeeIsValid = false;
					}
				}
			}

			if (employeeIsValid) {
				employees.add(tempEmployee);
			} else {
				if (!isHired) {
					description.append(" is not hired and can't have pension fund");
				} else if (!hasPensionFund) {
					description.append(" ist not yet registered at pension fund");
				}
				
				System.out.println("> ERROR: -> Employee: " + tempEmployee.getName() + " with ID: " + tempEmployee.getId() + description.toString());
			}
		}
	
		return employees;
	}
	
	private static void createSqlInsertFiles(List<Object> l, String sqlHeader, String file, String path) throws IOException, InterruptedException {
		FileWriter fileWriter = new FileWriter(path + file);
		PrintWriter printWriter = new PrintWriter(fileWriter);
		
		boolean firstCall = true;
		printWriter.print(sqlHeader);

		for (Object current : l) {
			if (firstCall) {
				printWriter.print(" " + current.toString().substring (1, current.toString().length()));
				firstCall = false;
			} else {
				printWriter.print(current.toString());
			}	
		}
		
		printWriter.print(";");
	    printWriter.close();
	}
	
}
