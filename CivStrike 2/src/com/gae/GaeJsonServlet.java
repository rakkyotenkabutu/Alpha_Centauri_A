/*!
* gaedirect v3.2.0
* *
* Copyright 2012, Katsuyuki Seino
* Licensed under the GPL Version 2 licenses.
* http://jquery.org/license
*
* Date: Mon May 29 2012
*/
package com.gae;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.http.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;

@SuppressWarnings("serial")
public class GaeJsonServlet extends HttpServlet {
	DatastoreService ds = DatastoreServiceFactory.getDatastoreService();	
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
	throws IOException {
		resp.setContentType("text/plain");
		resp.setCharacterEncoding("utf-8");
		PrintWriter out = resp.getWriter();
		String op = req.getParameter("op");
		String kind = req.getParameter("kind");
		String key = req.getParameter("key");
		String[] id = {};
		String[] val = {};
		if(!op.equals("del")){
			id = req.getParameter("id").split(",");
			val = req.getParameter("val").split("<p>");
		}
		JsonBeans jsbeans = new JsonBeans();
		if(op.equals("add")){
			/*
			 *   CRUD 登録処理 
			 */
			out.println(jsbeans.addDirect(kind, key, id, val));	
		}else if(op.equals("upd")){
			/*
			 *   CRUD 更新処理
			 */
			out.println(jsbeans.updDirect(kind, key, id, val));	
		}else if(op.equals("del")){
			/*
			 *   CRUD 削除処理
			 */
			out.println(jsbeans.delDirect(kind, key));
		}
	}
		
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
													throws IOException {
		resp.setContentType("text/plain");
		resp.setCharacterEncoding("utf-8");
		PrintWriter out = resp.getWriter();
		
		String kind = req.getParameter("kind");
		String key = req.getParameter("key");	
		String[] id = req.getParameter("id").split(",");
		
		JsonBeans jsbeans = new JsonBeans();
		if(!req.getParameter("key").equals("none")){
			/*
			 *  CRUD 参照処理
			 */
			out.println(jsbeans.revDirect(kind, key, id));
		}else if(req.getParameter("key").equals("none")){
			/*
			 *   条件参照処理
			 */
			int offset = 0;
			int limit = 0;
			String outs = "";
			try{
				Query query = new Query(kind); 					//（１）	
				/*
				 * Start condition setting 
				 */
				if(req.getParameter("OFFSET").length() > 0){					
					offset = Integer.parseInt(req.getParameter("OFFSET"));	
				}
				if(req.getParameter("LIMIT").length() > 0){					
					limit = Integer.parseInt(req.getParameter("LIMIT"));	
				}				
				if(req.getParameter("SORT").indexOf(":") != -1){					
					String[] sort = req.getParameter("SORT").split(":");
					if(sort[1].equals("ASCENDING")){
						query.addSort(sort[0], SortDirection.ASCENDING);
					}else if(sort[1].equals("DESCENDING")){
						query.addSort(sort[0], SortDirection.DESCENDING);
					}					
				}
				if(req.getParameter("EQUAL").indexOf(":") != -1){
					String[] equal = req.getParameter("EQUAL").split(":");
					query.addFilter(equal[0], FilterOperator.EQUAL, equal[1]);
				}
				if(req.getParameter("NOT_EQUAL").indexOf(":") != -1){
					String[] equal = req.getParameter("NOT_EQUAL").split(":");
					query.addFilter(equal[0], FilterOperator.NOT_EQUAL, equal[1]);
				}
				if(req.getParameter("GREATER_THAN").indexOf(":") != -1){
					String[] parms = req.getParameter("GREATER_THAN").split(":");
					if(parms.length > 2){
						if(parms[0].equals("st")){
							String val2 = parms[2].trim();
							query.addFilter(parms[1], FilterOperator.GREATER_THAN, val2);
						}else if(parms[0].equals("by")){
							byte[] val2 = parms[2].trim().getBytes("UTF-8");
							query.addFilter(parms[1], FilterOperator.GREATER_THAN, val2);
						}else if(parms[0].equals("sh")){	
							short val2 = Short.parseShort(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN, val2);
						}else if(parms[0].equals("in")){		
							int val2 = Integer.parseInt(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN, val2);						
						}else if(parms[0].equals("lo")){			
							long val2 = Long.parseLong(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN, val2);
						}else if(parms[0].equals("fl")){				
							float val2 = Float.parseFloat(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN, val2);
						}else if(parms[0].equals("do")){
							double val2 = Double.parseDouble(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN, val2);
						}	
					}else{
						query.addFilter(parms[0], FilterOperator.GREATER_THAN, parms[1]);
					}					
				}
				if(req.getParameter("GREATER_THAN_OR_EQUAL").indexOf(":") != -1){
					String[] parms = req.getParameter("GREATER_THAN_OR_EQUAL").split(":");
					if(parms.length > 2){
						if(parms[0].equals("st")){
							String val2 = parms[2].trim();
							query.addFilter(parms[1], FilterOperator.GREATER_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("by")){
							byte[] val2 = parms[2].trim().getBytes("UTF-8");
							query.addFilter(parms[1], FilterOperator.GREATER_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("sh")){	
							short val2 = Short.parseShort(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("in")){		
							int val2 = Integer.parseInt(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN_OR_EQUAL, val2);						
						}else if(parms[0].equals("lo")){			
							long val2 = Long.parseLong(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("fl")){				
							float val2 = Float.parseFloat(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("do")){
							double val2 = Double.parseDouble(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.GREATER_THAN_OR_EQUAL, val2);
						}	
					}else{
						query.addFilter(parms[0], FilterOperator.GREATER_THAN_OR_EQUAL, parms[1]);
					}		
				}		
				if(req.getParameter("LESS_THAN").indexOf(":") != -1){
					String[] parms = req.getParameter("LESS_THAN").split(":");
					if(parms.length > 2){
						if(parms[0].equals("st")){
							String val2 = parms[2].trim();
							query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
						}else if(parms[0].equals("by")){
							byte[] val2 = parms[2].trim().getBytes("UTF-8");
							query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
						}else if(parms[0].equals("sh")){	
							short val2 = Short.parseShort(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
						}else if(parms[0].equals("in")){		
							int val2 = Integer.parseInt(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);						
						}else if(parms[0].equals("lo")){			
							long val2 = Long.parseLong(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
						}else if(parms[0].equals("fl")){				
							float val2 = Float.parseFloat(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
						}else if(parms[0].equals("do")){
							double val2 = Double.parseDouble(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
						}else if(parms[0].equals("bo")){
							if(parms[2].toUpperCase().equals("TRUE")){
								boolean val2 = Boolean.parseBoolean("true"); 
							}else if(parms[2].toUpperCase().equals("FALSE")){
								boolean val2 = Boolean.parseBoolean("false"); 
							}
						}					
					}else{
						query.addFilter(parms[0], FilterOperator.LESS_THAN, parms[1]);
					}										
				}				
				if(req.getParameter("LESS_THAN_OR_EQUAL").indexOf(":") != -1){
					String[] parms = req.getParameter("LESS_THAN_OR_EQUAL").split(":");
					if(parms.length > 2){
						if(parms[0].equals("st")){
							String val2 = parms[2].trim();
							query.addFilter(parms[1], FilterOperator.LESS_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("by")){
							byte[] val2 = parms[2].trim().getBytes("UTF-8");
							query.addFilter(parms[1], FilterOperator.LESS_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("sh")){	
							short val2 = Short.parseShort(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("in")){		
							int val2 = Integer.parseInt(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN_OR_EQUAL, val2);						
						}else if(parms[0].equals("lo")){			
							long val2 = Long.parseLong(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("fl")){				
							float val2 = Float.parseFloat(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("do")){
							double val2 = Double.parseDouble(parms[2].trim());
							query.addFilter(parms[1], FilterOperator.LESS_THAN_OR_EQUAL, val2);
						}else if(parms[0].equals("bo")){
							if(parms[2].toUpperCase().equals("TRUE")){
								boolean val2 = Boolean.parseBoolean("true"); 
							}else if(parms[2].toUpperCase().equals("FALSE")){
								boolean val2 = Boolean.parseBoolean("false"); 
							}
						}					
					}else{
						query.addFilter(parms[0], FilterOperator.LESS_THAN_OR_EQUAL, parms[1]);
					}
				}		
				if(req.getParameter("IN").indexOf(":") != -1){
					String[] prop = req.getParameter("IN").split(":");
					String[] args = prop[1].split(",");
					query.addFilter(prop[0], FilterOperator.IN, Arrays.asList(args));
				}				
				List<Entity> entities = null;
				if(limit <= 0){
					entities = ds.prepare(query).asList(FetchOptions.Builder.withOffset(offset));		//�i2�j
				}else {
					entities = ds.prepare(query).asList(FetchOptions.Builder.withLimit(limit).offset(offset));	
				}
				/*
				 *  End condition setting
				 */
				for (Entity entity : entities) {	
					String skey = entity.getKey().toString();
					outs += skey + "<p>";
					String prop[][] = jsbeans.getprop(id); 
					for(int i = 0; i < id.length; i++){
						try{							
							if(entity.hasProperty(prop[i][1])){	
								if(prop[i][0].equals("st")){
									if (entity.getProperty(prop[i][1]).toString().indexOf(",")== -1){
										String property = entity.getProperty(prop[i][1]).toString();
										outs += property + "<p>";
									}else{
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";		
									}
								}else if(prop[i][0].equals("te")){				//Long text
									if (entity.getProperty(prop[i][1]).toString().indexOf(",")== -1){
										Text property = (Text) entity.getProperty(prop[i][1]);
										outs += property.getValue() + "<p>";
									}else{
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";	
									}
								}else if(prop[i][0].equals("by")){				//byte
									if (entity.getProperty(prop[i][1]).toString().indexOf(",")== -1){
										Byte property = Byte.parseByte(entity.getProperty(prop[i][1]).toString());
										outs += property + "<p>";
									}else{
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";	
									}	
								}else if(prop[i][0].equals("sh")){				//short
									if (entity.getProperty(prop[i][1]).toString().indexOf(",")== -1){
										Short property = Short.parseShort(entity.getProperty(prop[i][1]).toString());
										outs += property + "<p>";
									}else{
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";	
									}		
								}else if(prop[i][0].equals("in")){  			//integer
									if (entity.getProperty(prop[i][1]).toString().indexOf(",")== -1){		//Not List property
										int property = Integer.parseInt(entity.getProperty(prop[i][1]).toString());
										outs += property + "<p>";
									}else{				//List property
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";							
									}									
								}else if(prop[i][0].equals("lo")){				//long
									if (entity.getProperty(prop[i][1]).toString().indexOf(",")== -1){
										//Long property = Long.parseLong(entity.getProperty(prop[i][1]).toString());
										//outs += property + "<p>";
										
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";										
										
									}else{				//List property
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";							
									}			
								}else if(prop[i][0].equals("fl")){				//Float
									if (entity.getProperty(prop[i][1]).toString().indexOf(",")== -1){
										float property = Float.parseFloat(entity.getProperty(prop[i][1]).toString());
										outs += property + "<p>";
									}else{				//List property
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";							
									}		
								}else if(prop[i][0].equals("do")){				//Double
									if (entity.getProperty(prop[i][1]).toString().indexOf(",")== -1){
										double property = Double.parseDouble(entity.getProperty(prop[i][1]).toString());
										outs += property + "<p>";
									}else{				//List property
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";							
									}			
								}else if(prop[i][0].equals("bo")){				//Boolean
									if (entity.getProperty(prop[i][1]).toString().indexOf(",")== -1){
										boolean property = Boolean.valueOf(entity.getProperty(prop[i][1]).toString());
										outs += property + "<p>";
									}else{				//List property
										String property = entity.getProperty(prop[i][1]).toString().replaceAll("[ \\[\\]]", "");
										outs += property + "<p>";							
									}		
								}								
							}							
						}catch(Exception e){
							ArrayList<String> array = new ArrayList<String>();
							outs += array + "<p>";
						}						
					}
					if(outs.length()>3){
						outs = outs.substring(0, outs.length()-3);
					}
					outs += "<e>";
				}
				//if(outs.length() > 6){
				//	out.println(outs.substring(0, outs.length()-6));
				//}else{
				//	out.println(outs);
				//}
				if(outs.length()>3){
					outs = outs.substring(0, outs.length()-3);
				}
				out.println(outs);
			}catch(Exception e){
				out.println("Error = " + e);
			}
		}
	}	
	public static Query setParms(Query query, String[] parms) throws Exception{
		if(parms.length > 2){
			if(parms[0].equals("st")){
				byte[] val2 = parms[2].trim().getBytes("UTF-8");
				query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
			}else if(parms[0].equals("by")){
				byte[] val2 = parms[2].trim().getBytes("UTF-8");
				query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
			}else if(parms[0].equals("sh")){	
				short val2 = Short.parseShort(parms[2].trim());
				query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
			}else if(parms[0].equals("in")){		
				int val2 = Integer.parseInt(parms[2].trim());
				query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);						
			}else if(parms[0].equals("lo")){			
				long val2 = Long.parseLong(parms[2].trim());
				query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
			}else if(parms[0].equals("fl")){				
				float val2 = Float.parseFloat(parms[2].trim());
				query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
			}else if(parms[0].equals("do")){
				double val2 = Double.parseDouble(parms[2].trim());
				query.addFilter(parms[1], FilterOperator.LESS_THAN, val2);
			}
		}else{
			query.addFilter(parms[0], FilterOperator.LESS_THAN, parms[1]);
		}
		return query;
	}	
}
