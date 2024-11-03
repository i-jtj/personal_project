package com.example.demo.conmon;


public class Result {
    private int code;
    private String msg;
    private Object data;

  public  Result(){

  }
    private void setCode(int i) {
        this.code = i;
    }

    private void setMsg(String s) {
        this.msg = s;
    }

    private void setData(Object o) {
        this.data = o;
    }
    
// 必须有getter，否则无法返回json
    public int getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }

    public Object getData() {
        return data;
    }



    public static Result success(String message, Object data) 
    {
        Result res= new Result();
        res.setCode(1);
        res.setMsg(message);
        res.setData(data);
        return res;
    }



    public static Result success(String message) 
    {
        Result res= new Result();
        res.setCode(1);
        res.setMsg(message);
        return res;

    }

    public static Result error(String message){

        Result res= new Result();
        res.setCode(500);
        res.setMsg(message);
        return res;

    }

}
