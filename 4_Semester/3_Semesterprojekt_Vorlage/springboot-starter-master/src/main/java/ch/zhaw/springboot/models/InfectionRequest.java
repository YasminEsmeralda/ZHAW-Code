package ch.zhaw.springboot.models;

public class InfectionRequest {
	public long time;
	public String location;
	public long person_id;
	public long pathogen_id;
	
	public InfectionRequest(long time, String location, long person_id, long pathogen_id) {
		this.time = time;
		this.location = location;
		this.person_id = person_id;
		this.pathogen_id = pathogen_id;
	}	
}
