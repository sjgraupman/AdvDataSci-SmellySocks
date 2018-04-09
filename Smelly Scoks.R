data=read.csv("C:/Users/Paromita/Desktop/Spring 2018/Adv.data Science/AdvDataSci-SmellySocks-master/Sock_Data_Library_UPDATED.csv", header= T)
names(data)

Age= c(data$SockOwner1_Age, data$SockOwner2_Age)
Smelliness= c(data$SockOwner1_Smelliness, data$SockOwner2_Smelliness)
Gender= c(as.character(data$SockOwner1_Gender), as.character(data$SockOwner2_Gender))
Country= c(as.character(data$SockOwner1_Country), as.character(data$SockOwner2_Country))

new_data= data.frame(Gender,Age,Country,Smelliness)

setDT(new_data)[ Age <21,  Agegroup := "0 to 20"]
new_data[Age >20 & Age <41, Agegroup := "21 to 40"]
new_data[Age >40 & Age <61, Agegroup := "41 to 60"]
new_data[Age >60 & Age <81, Agegroup := "61 to 80"]
new_data[Age >80, Agegroup := "Over 80"]


## Box Plot:
library(ggplot2)

fun_median=function(x){return(data.frame(y=median(x),label=median(x,na.rm=T)))}

ggplot(new_data, aes(x=Gender, y=Smelliness, fill=Gender)) + geom_boxplot()+scale_color_brewer(palette="Dark2")+
  stat_summary(fun.data = fun_median, geom="text", vjust=-0.2)+ labs(title="Boxplot: Scoks Smelliness by Gender")

# Side by side Histogram with two variate

ggplot(new_data, aes(x=Age, y=Smelliness)) +geom_bar(stat="identity", position="dodge",color="lightblue")+ 
  labs(title="Histogram: Scoks Smelliness by Age")


ggplot(new_data, aes(Age, Smelliness))+ geom_jitter(width = .5, size=1, color="lightgreen")+ 
  labs(title="Scatter Plot: Scoks Smelliness by Age")



theme_set(theme_bw()) 
ggplot(new_data, aes(Age, Smelliness))+ geom_count(col="lightblue1", show.legend=F) +
  labs(subtitle="Scoks Smelliness by Age", 
       y="Smelliness", 
       x="Age", 
       title="Counts Plot")



ggplot(new_data, aes(x=Agegroup, y=Smelliness, fill=Agegroup)) + geom_boxplot()+scale_color_brewer(palette="Dark2")+
  stat_summary(fun.data = fun_median, geom="text", vjust=-0.2)+ labs(title="Boxplot: Scoks Smelliness by Age")+ theme(axis.text.x = element_text(angle = 35, hjust = 1))

